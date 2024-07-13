import { setFailed } from '@actions/core';
import { action } from './action';

const run = async () => {
  try {
    await action();
  } catch (error: any) {
    setFailed(error.message);
  }
};

run();
