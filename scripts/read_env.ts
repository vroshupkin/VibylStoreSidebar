import { ENV } from '../env';
import { stdout, stdin } from 'node:process';


async function main()
{   
  stdin.on('data', (data) => 
  {
    const input_arr = data.toString().trim().split('.');

    let out = ENV;
    for (const key of input_arr) 
    {
      if(!(key in out))
      {
        // @ts-ignore
        out = {};
        break;
      }
      // @ts-ignore
      out = out[key];
    }

    console.log(out);
    
  });

}

main();
