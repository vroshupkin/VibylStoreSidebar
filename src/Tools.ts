

namespace Tools
{

  export function getSheet(name: Constants.TSheetsNames)
  {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  }
/**
 * Используется для взаимодействия с дропдаун ячейкой
 */
export class Dropdown
{
  private values: string[];

  /**
   * @param cell ячейка с одним значением 
   */
  constructor(cell: GoogleAppsScript.Spreadsheet.Range)
  {
    // TODO Сделать поверку что DataValidations содерржит dropdown range
    const dropdown_range = cell.getDataValidations()?.[0][0]
      ?.getCriteriaValues()[0] as GoogleAppsScript.Spreadsheet.Range;
    
    if(!dropdown_range)
    {
      throw new UiError('');
    }

    this.values = dropdown_range.getValues().flat();
  }

  includes = (str: string) => 
  {
    return this.values.includes(str);
  };
}

interface IToString {
  toString: () => string
}
/**
 * Ошибка с всплывающим окном
 */
export class UiError extends Error
{
  constructor(message: IToString | null | undefined) 
  {
    super();

    this.name = 'UiError';
    this.message = message + '';
    SpreadsheetApp.getUi().alert(this.stack + '');
  }
}


/**
 * Переводит индекс столбца в буквенно обозначение
 * @param num индекс столбца
 * @example ConverToChar(1) = "A"; ConverToChar(10) = "J"; ConverToChar(27) = "AA"
 */
export const ConverToChar = (num: number) => 
{
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const latters: string[] = [];
  do
  {
    num -= 1;
    latters.push(alphabet[num % 26]);
    num = Math.floor(num / 26);
  }while(num > 0);

  let output = '';
  while(latters.length)
  {
    output += latters.pop();
  }
  
  return output;
};

/**
 * Создает строку из len пробелов
 * @example generate_n_spaces(5) => '     '
 */
export const generate_n_spaces = (len: number): string =>
{
  let out = '';
  while(len--) {out += ' ';}
  
  return out;
}; 

/**
   * Генерирует название колонок в JSON строке для использования в коде. Для использования нужно выделить строку с 
   * нужными строками 
   * @param range Первая ячейка строки
   * @param offset 
   */
export const GenerateColumnIndexes = (range: GoogleAppsScript.Spreadsheet.Range, offset = 1) => 
{
  // Перевести в выделение строки
  const column_names = range.getValues()[0];
  const have_dict: {[s: string]: any} = {};
  column_names.forEach((key, i) => 
  {
    key = key + '';
    while(have_dict[key] != undefined)
    {
      key += 'COPY';
    }

    have_dict[key] = Tools.ConverToChar(i + offset);
  });

  new Tools.UiError(JSON.stringify(have_dict));

  let output = '';
  let count = 0;
  for (const key in have_dict) 
  {
    const val = have_dict[key];
    
    // Поиск символа новой строки и замена на валидный символ
    const ind_newline = val.indexOf('\n');
    if(ind_newline >= 0)
    {
      val[ind_newline] = '\\\n';
    }

    const new_line = count == 2? '\n': '';
    const columns_string = `'${key}': ${val}, ${new_line}`;
    
    count = count == 2? 0: ++count;
    output += columns_string;
  }

  return `{${output}}`;
};

  /**
   * Автоматическое протягивание
   */
  export const auto_column = 
  (sheet: GoogleAppsScript.Spreadsheet.Sheet) => (start_y: number, start_x: number, rows_num: number) => 
  {
    const start_cell = sheet.getRange(start_y, start_x);
    const destination = sheet.getRange(start_y, start_x, rows_num);
    start_cell.autoFill(destination, SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES); 
  };

  
  /** 
   * Ищет в аннотациях названия 'auto' и делает автозаполнение колонки
   * @param header_range Строка с названием таблиц и аннотацией
   * @param insert_y Строка с формулами изменением данных
   * @param headers_cells Строка с заполненными формулами
   */
  export const setAutoColumn = (
    params: {
      header_range: GoogleAppsScript.Spreadsheet.Range,
      header_cells: GoogleAppsScript.Spreadsheet.Range,
      insert_y: number,
      sheet_name: GoogleAppsScript.Spreadsheet.Sheet
    }
  ) => 
  { 
    const { header_range, header_cells, insert_y, sheet_name: sheet } = params;
     
    const notes = header_range.getNotes()[0];

    const header_y = header_range.getRow();

    for (let i = 0; i < notes.length; i++) 
    {      
      
      let note = notes[i];
      note = note.slice(0, 4);

      if(note != 'auto') {continue;}
      
      const x =  header_range.getColumn() + i;      

      const source_cell = sheet.getRange(header_y + 1, x);
      const insert_cell = sheet.getRange(insert_y, x);

      const cell_validation_type = Tools.readHeaderCache(i, Constants.CACHE_NAMES.EconomyHeader + '');
      if(cell_validation_type === undefined) 
      {  
        Tools.updateHeaderCache(header_cells, Constants.CACHE_NAMES.EconomyHeader);
      }

      const { CHECKBOX, DEFAULT, DROPDOWN } = EnumCellType;
      
      switch(cell_validation_type + '')
      {
        case DEFAULT + '': {
          Tools.auto_column(sheet)(header_y + 1, x, insert_y - header_y);
          break;
        }
        case DROPDOWN + '': {
          const default_dropdown_val = source_cell.getValue();
          insert_cell.setValue(default_dropdown_val);
          break;  
        }
        case CHECKBOX + '':{
          insert_cell.setValue('');
          break;  
        }
      }
    }
    

  };


  /**
   * Смотрит какого типа ячейка: обычная, чекбокс, dropdown
   * @param cell 
   * @returns 
   */
  export const get_cell_type = (cell: GoogleAppsScript.Spreadsheet.Range) => 
  {
    const criteria_type = cell.getDataValidation()?.getCriteriaType();

    const { CHECKBOX, VALUE_IN_LIST, VALUE_IN_RANGE } = SpreadsheetApp.DataValidationCriteria;

    switch(criteria_type)
    {
      case undefined: return EnumCellType.DEFAULT;
      case CHECKBOX: return EnumCellType.CHECKBOX;
      case VALUE_IN_LIST: return EnumCellType.DROPDOWN;
      case VALUE_IN_RANGE: return EnumCellType.DROPDOWN;

    }

    
  };
  

  export enum EnumCellType{ DEFAULT, CHECKBOX, DROPDOWN}
    
  export function readHeaderCache(i: number, cache_key: string)
  {
    let arr_str = CacheService.getDocumentCache()?.get(cache_key);
    arr_str = arr_str ?? '';
    const arr = (Array.from<unknown>(arr_str)[i]);

    return arr;
  }

  
/**
 * TODO сделать на дженериках
 * @param x 
 * @param y 
 * @param sheet 
 */
export function updateHeaderCache(header_range: GoogleAppsScript.Spreadsheet.Range, cache_name: Constants.CACHE_NAMES)
{
  const last_column = header_range.getLastColumn(); 

  let cache_str = '';
  for(let x = 1; x <= last_column; x++)
  {
    const cell = header_range.getCell(1, x);
    cache_str +=  Tools.get_cell_type(cell);
  }

  CacheService.getDocumentCache()?.put(cache_name + '', cache_str);
}
  
  export class TimestampTools
  {
    timestamps: Date[];
    timestamps_names: string[];
    constructor()

    {
      [ this.timestamps, this.timestamps_names ] = [ [], [] ];
      
    }

    tag(name: string)
    {
      this.timestamps.push(new Date()) && this.timestamps_names.push(name ?? '');
    }

    toString()
    {
      const get_time = (t: Date) => 
      {
        const time = t.getTime() - this.timestamps[0].getTime();
        if(time < 1000)
        {
          return time + 'ms';
        }
        else
        {
          return time / 1000 + 's';
        }

      };
      const timestamps_arr = this.timestamps.map(get_time);
      const timestamps_msg = timestamps_arr.map((_, i) => `[ ${this.timestamps_names[i]}, ${timestamps_arr[i]} ]`);
      
      return timestamps_msg + '';
    
    }
  }
 

  /**
   * Собирает query search параметр
   * @example url_builder('https://api.moysklad.ru/api/remap/1.2','hello', {a: '10', b: '20'}) => 
   * "https://api.moysklad.ru/api/remap/1.2/hello?a=10&b=20" 
   */
  export const url_builder = (base_url: string, end_point: string, query_params: Record<string, string>) => 
  {
    let query = Object.entries(query_params)
      .map(v => `&${v[0]}=${v[1]}`)
      .reduce((a, b) => a + b);
  
    query = query.slice(1, query.length);

    return `${base_url}/${end_point}?${query}`;

  };

}

