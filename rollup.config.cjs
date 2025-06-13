const replace = require('@rollup/plugin-replace');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').default;
const postcss = require('rollup-plugin-postcss');

module.exports = {
  input: 'entry-appointment-picker.js',
  external: [
    'react',
    'react-dom',
    'react-day-picker',
    'date-fns'
  ],
  output: {
    file: 'instructor-portal-app/public/js/appointmentPicker.umd.js',
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
      preventAssignment: true
    }),
    postcss({ minimize: true }),
    resolve({ extensions: ['.js', '.jsx'] }),
    commonjs({ transformMixedEsModules: true }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx'],
      exclude: 'node_modules/**'
    }),
  ],
};