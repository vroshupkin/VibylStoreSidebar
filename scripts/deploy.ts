import { execSync } from 'node:child_process';
import { argv } from 'node:process';
import { ENV } from '../env';


const main = async () => 
{  
  console.time(__filename);

  if(argv[2] != 'prod' && argv[2] != 'dev')
  {
    throw new Error();
  }
  
  const [ a, b, type, only_deploy ] = argv;

  // @ts-ignore
  const deployment_id = ENV.deployment_id[type];

  try
  {
    const push_stream = execSync(`npx clasp deploy --deploymentId ${deployment_id}`);
    console.log(push_stream + '');
  }
  catch(err)
  {
    // @ts-ignore
    console.log(err.stdout + '');
    // @ts-ignore
    console.log(err.stderr + '');
  }
  
  console.timeEnd(__filename);

};

main();