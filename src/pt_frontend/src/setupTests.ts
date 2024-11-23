import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
import 'cross-fetch/polyfill';

expect.extend(matchers);
