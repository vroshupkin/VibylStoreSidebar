
export function Model__ReadArticle(row: number)
{

  const name: Constants.TSheetsNames = '🗄️ Каталог';

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  
  if(!sheet)
  {
    throw new Error(`Лист с именем ${name} не найден`);    
  }
  

  const XCell = Constants.XCell;
  
  const get_url = (row: number) => 
  {
    const str =sheet.getRange(row, XCell.D).getFormula();
    
    return str.split('"')[1] ?? '';
  };
  
  //   new Tools.UiError(sheet.getRange(row, XCell.D).getFormula());

  const out = {
    artist: sheet.getRange(row, XCell.U).getValue(),
    image_url: get_url(row)
  };

  //   new Tools.UiError(JSON.stringify(out));

  return out;
}

