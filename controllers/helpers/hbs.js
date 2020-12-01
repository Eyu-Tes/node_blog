// handlebars helpers

module.exports = {
    // check if the two URLs are equal
    urlsEqual : (path, href) => (path === href),
    // set the selected item in a radio button group in handlebars template
    setChecked: (value, currentValue) => value === currentValue ? "checked" : '', 
    // check whether a checkbox is selected
    selected: (value, currentValues=[]) => currentValues.includes(String(value)) && "checked"
}
