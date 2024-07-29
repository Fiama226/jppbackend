const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
module.exports = {localStorage};