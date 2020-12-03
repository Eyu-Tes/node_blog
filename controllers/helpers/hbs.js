// handlebars helpers

const moment = require('moment')

module.exports = {
    // date format
    formatDate: (date, format) =>  moment(date).utc().format(format),

    // check if the two URLs are equal
    urlsEqual : (path, href) => (path === href),

    // set the selected item in a radio button group in handlebars template
    setChecked: (value, currentValue) => value === currentValue ? "checked" : '', 

    // check whether a checkbox is selected
    selected: (value, currentValues=[]) => currentValues.includes(String(value)) && "checked", 

    // trim string with characters exceeding the specified length
    truncate: (str, len) => {
        if(str.length > len && str.length > 0) {
            let new_str = str + ' '
            new_str = str.substr(0, len)
            new_str = str.substr(0, new_str.lastIndexOf(' '))
            new_str = new_str.length > 0 ? new_str : str.substr(0, len)
            return new_str + '...'
        }
        return str
    },

    // show edit icon if the logged user is the owner of the post
    showEditIcon: (owner, loggedUser={_id: ''}) => owner._id.toString() === loggedUser._id.toString(),
}
