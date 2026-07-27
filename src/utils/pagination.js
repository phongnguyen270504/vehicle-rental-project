const builtPagination = (currentPage, totalPages, maxButtons=5)=>{

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) 
    {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    const pages = [];
    for(let i= startPage; i<= endPage; i++){
        pages.push(i);
    }
    return {
        pages,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages
    };
}

module.exports={builtPagination};