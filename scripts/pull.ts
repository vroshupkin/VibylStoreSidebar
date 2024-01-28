import { execSync } from 'node:child_process';
import { is_object } from './common';

function main() 
{
  console.log(`${__filename} running...`);
  console.time(__filename);
  
  [
    'npx clasp pull',
    'mv -v ./src/*.js ./build/',
    'mv -v ./src/**/*.js ./build/ || echo',
    'cp -rv ./src/**/*.html ./build'
  ].forEach(cmd => 
  {
    try
    {
      const mv_stream = execSync(cmd);
      console.log(mv_stream + '');
    }
    catch(e)
    {
      // @ts-ignore
      console.log(e.output[1]);
      throw e;
    }
    
  });

  console.timeEnd(__filename);  
}

main();

