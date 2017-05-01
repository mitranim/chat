// true = use subdirectories
// http://fineonly.com/solutions/regex-exclude-a-string
const requireContext = require.context('./', true, /^((?!\/index).)*\.js$/)

_.assign(exports, ...requireContext.keys().map(requireContext))

_.assign(window.app, {utils: exports})
