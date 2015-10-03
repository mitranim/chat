// jQuery is required by Bootstrap.
import $ from 'jquery'
window.jQuery = $
// Has to be included with `require`, otherwise it'll be executed before we
// assign jQuery to window.
require('bootstrap-sass')

// Activate our components.
import './chat'
