// Paginator class
class Paginator {
    constructor(total, perPage) {
        this.total = total
        this.perPage = Number(perPage)
        this.numberOfPages = Math.floor((total-1) / perPage) + 1
    }
    getPage(currentPageNumber) {
        return  {
            total: this.total,
            limit: this.perPage,
            first: 1, 
            last: this.numberOfPages,
            hasPrevious: Number(currentPageNumber) > 1, 
            hasNext: Number(currentPageNumber) < this.numberOfPages, 
            pageRange: this.numberOfPages, 
            inPageRange: this.numberOfPages >= currentPageNumber,
            number: Number(currentPageNumber), 
            previousPageNumber: Number(currentPageNumber)-1, 
            nextPageNumber: Number(currentPageNumber)+1, 
            currentFirst: Math.min(((Number(currentPageNumber-1) * this.perPage) + 1), this.total), 
            currentLast: Math.min((Number(currentPageNumber) * this.perPage), this.total)
        }   
    }
}

module.exports = Paginator
