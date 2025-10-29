const SHEET_NAME = 'gsheetfacts';

/**
 * Adds a single, unified "Brevito" menu to the spreadsheet UI.
 * This function runs automatically when the spreadsheet is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Brevito')
      .addItem('Sync with Supabase', 'syncWithSupabase')
      .addSeparator()
      .addItem('Generate Image Search URLs', 'generatePixabayUrls')
      .addToUi();
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} s The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(s) {
  if (typeof s !== 'string' || !s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Fetches data from a denormalized sheet and syncs it with normalized Supabase tables.
 */
function syncWithSupabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData.shift(); // Remove header row

  // --- Dynamic Header Parsing ---
  const factColumnHeaders = ['fact_id', 'category', 'subcategory', 'fact_text', 'source', 'source_url', 'image_url', 'image_credit'];
  const headerMap = {
    factColumns: {},
    translationColumns: []
  };

  headers.forEach((header, index) => {
    if (factColumnHeaders.includes(header)) {
      headerMap.factColumns[header] = index;
    } else {
      // Updated regex to capture optional '_extended' suffix
      const match = header.match(/^([a-z]+)_(beginner|intermediate|advanced)_text(_extended)?$/);
      if (match) {
        headerMap.translationColumns.push({
          language: match[1],
          level: match[2],
          // Construct the db_key to include '_extended' if present
          db_key: `${match[2]}_text${match[3] || ''}`,
          index: index
        });
      }
    }
  });
  // --- End Header Parsing ---

  const properties = PropertiesService.getScriptProperties();
  const SUPABASE_URL = properties.getProperty('SUPABASE_URL');
  const SUPABASE_KEY = properties.getProperty('SUPABASE_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    Logger.log('ERROR: Supabase URL or Key not set in Script Properties.');
    return;
  }

  const baseApiUrl = `${SUPABASE_URL}/rest/v1`;
  const options = {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    muteHttpExceptions: true,
  };

  // Fetch all existing data from Supabase for comparison
  const dbFactsResponse = UrlFetchApp.fetch(`${baseApiUrl}/og_facts?select=*`, options);
  const dbFactsResult = JSON.parse(dbFactsResponse.getContentText());
  const dbFactsMap = new Map(dbFactsResult.map(f => [f.id, f]));

  const dbTranslationsResponse = UrlFetchApp.fetch(`${baseApiUrl}/fact_translations?select=*`, options);
  const dbTranslationsResult = JSON.parse(dbTranslationsResponse.getContentText());
  const dbTranslationsMap = new Map(dbTranslationsResult.map(t => [`${t.fact_id}-${t.language}`, t]));
  
  const sheetFactIds = new Set();

  sheetData.forEach((row, rowIndex) => {
    if (row.every(cell => cell === '')) return; // Skip empty rows

    // 1. Extract Fact Data from the row using the header map
    const factId = row[headerMap.factColumns['fact_id']];
    const sheetFact = {};
    for (const key in headerMap.factColumns) {
      if (key !== 'fact_id') {
        sheetFact[key] = row[headerMap.factColumns[key]];
      }
    }

    // 2. Group all translation data for the current row by language
    const sheetTranslations = {};
    headerMap.translationColumns.forEach(col => {
      const lang = capitalize(col.language);
      if (!sheetTranslations[lang]) {
        sheetTranslations[lang] = { language: lang };
      }
      const cellValue = row[col.index];
      if (cellValue) {
        sheetTranslations[lang][col.db_key] = cellValue;
      }
    });

    // 3. Sync Logic
    if (factId) {
      sheetFactIds.add(factId);
      const dbFact = dbFactsMap.get(factId);

      // Sync the main fact data
      const isFactDifferent = Object.keys(sheetFact).some(key => dbFact[key] !== sheetFact[key]);
      if (dbFact && isFactDifferent) {
        Logger.log(`Updating fact ${factId}...`);
        options.method = 'patch';
        options.payload = JSON.stringify(sheetFact);
        UrlFetchApp.fetch(`${baseApiUrl}/og_facts?id=eq.${factId}`, options);
      }
      
      // Sync each translation for the fact
      for (const lang in sheetTranslations) {
        const sheetTranslation = sheetTranslations[lang];
        const dbTranslation = dbTranslationsMap.get(`${factId}-${lang}`);

        if (dbTranslation) {
          const isTranslationDifferent = Object.keys(sheetTranslation).some(key => dbTranslation[key] !== sheetTranslation[key]);
          if (isTranslationDifferent) {
            Logger.log(`Updating translation for ${factId} (${lang})...`);
            options.method = 'patch';
            options.payload = JSON.stringify(sheetTranslation);
            UrlFetchApp.fetch(`${baseApiUrl}/fact_translations?fact_id=eq.${factId}&language=eq.${lang}`, options);
          }
        } else {
          Logger.log(`Inserting new translation for ${factId} (${lang})...`);
          options.method = 'post';
          const payload = { fact_id: factId, ...sheetTranslation };
          options.payload = JSON.stringify(payload);
          UrlFetchApp.fetch(`${baseApiUrl}/fact_translations`, options);
        }
      }

    } else { // No factId, so this is a new fact
      Logger.log(`Inserting new fact: ${sheetFact.fact_text.substring(0, 30)}...`);
      options.method = 'post';
      options.payload = JSON.stringify(sheetFact);
      const newFactResponse = UrlFetchApp.fetch(`${baseApiUrl}/og_facts`, options);
      const newFactResult = JSON.parse(newFactResponse.getContentText());

      if (newFactResult && newFactResult[0]) {
        const newFactId = newFactResult[0].id;
        sheet.getRange(rowIndex + 2, headerMap.factColumns['fact_id'] + 1).setValue(newFactId);
        sheetFactIds.add(newFactId);
        
        // Insert all translations for the new fact
        for (const lang in sheetTranslations) {
           const payload = { fact_id: newFactId, ...sheetTranslations[lang] };
           options.payload = JSON.stringify(payload);
           UrlFetchApp.fetch(`${baseApiUrl}/fact_translations`, options);
        }
      }
    }
  });

  // 4. Delete facts from DB that are no longer in the sheet
  dbFactsMap.forEach((_value, factId) => {
    if (!sheetFactIds.has(factId)) {
      Logger.log(`Deleting fact ${factId}...`);
      options.method = 'delete';
      UrlFetchApp.fetch(`${baseApiUrl}/og_facts?id=eq.${factId}`, options);
    }
  });

  Logger.log('Sync complete.');
}