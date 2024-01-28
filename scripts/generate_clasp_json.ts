import { writeFile } from 'node:fs/promises';
import { argv } from 'node:process';
import { ENV } from '../env';


// VIEW Не пишет ошибки!
const main = async () => 
{
  console.time(__filename);
  const rootDir = './src';
  
  const scriptId = argv[2] === 'prod' ? ENV.script_id.prod : ENV.script_id.dev;
  const message = argv[2] === 'prod' ? 'prod' : 'env';

  // const webapp = { 
  //   access: 'MYSELF',
  //   executeAs: 'USER_DEPLOYING'
  // };

  console.log(message.toUpperCase());
  
  await writeFile('.clasp.json', JSON.stringify({ scriptId, rootDir }));

  console.log('clasp.json was been generated');
  console.timeEnd(__filename);
};

main();