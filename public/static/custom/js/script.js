$('.remove-item').on('click', (e) => {
    const id = e.currentTarget.id
    $.ajax({
        url: `/post/${id}/remove`,
        type: 'get',
        dataType: 'json', 
        success: (data) => {
            $("#exampleModal .modal-title").html('Delete Post Confirmation')
            $("#exampleModal .modal-body").html(
                `<h5>Sure you want to delete <big class="text-primary">${data.post.title}</big>?</h5>`
            )
            $("#exampleModal .modal-footer form")[0].action = `/post/${data.post._id}/remove`
            $("#exampleModal").modal("show")
        }
    })
    return false
})
