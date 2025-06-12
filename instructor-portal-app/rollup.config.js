// rollup.config.js
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel    from '@rollup/plugin-babel';
import postcss  from 'rollup-plugin-postcss';

export default {
  input: 'src/entry-appointment-picker.js',
  external: [
    'react',
    'react-dom',
    'react-day-picker',
    'date-fns'
  ],
  output: {
    file: 'public/js/appointmentPicker.umd.js',
    format: 'umd',
    name: 'mountAppointmentPicker',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'react-day-picker': 'ReactDayPicker',
      'date-fns': 'dateFns'
    }
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
      include: ['node_modules/**']
    }),
    // 1) let Rollup understand CSS imports
    postcss({
      // extract: true,      // uncomment if you want a separate CSS file
      minimize: true,
    }),

    // 2) resolve node_modules imports
    resolve({ extensions: ['.js', '.jsx'] }),

    // 3) convert CommonJS modules to ES
    commonjs({
      transformMixedEsModules: true
    }),

    // 4) transpile JSX → JS
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx'],
      exclude: 'node_modules/**'
    }),
  ],
};