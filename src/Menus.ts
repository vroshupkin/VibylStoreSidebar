namespace Menus
{
  
  export function SideBars()
  {
    const sub_menus = [
      { name : 'Мой склад выгрузить релизы', functionName : onOpen.name },   
    ];

    SpreadsheetApp.getActiveSpreadsheet().addMenu('Sidebars', sub_menus);   

    const [ width, height ] = [ 400, 300 ];
    const html = HtmlService.createHtmlOutputFromFile('MoiSklad')
      .setWidth(width)
      .setHeight(height);

    SpreadsheetApp.getUi().showSidebar(html);
  }

}