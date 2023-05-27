import type {Config} from 'jest'

const config: Config ={
    setupFiles: ["./.jest/setEnvVars.ts"],
    verbose:true,
    collectCoverage:true
};

export default config