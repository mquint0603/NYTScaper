$(".save-btn").on("click", function(){
    console.log("saved")
    let thisID = $(this).attr("id")
    console.log($(this).attr("id"))
    $.ajax({
        type: "POST",
        url: `/save/${thisID}`, 
    }).then(function (result) {
        location.reload()
    })
})

$(".delete-btn").on("click", function(){
    console.log("saved")
    let thisID = $(this).attr("id")
    console.log($(this).attr("id"))
    $.ajax({
        type: "POST",
        url: `/unsave/${thisID}`, 
    }).then(function (result) {
        location.reload()
    })
})

$(".scrape").on("click", function(){
    $.ajax({
        type: "GET",
        url: `/scrape`, 
    }).then(function (result) {
        location.href = "/"
    })
})

$("#modalLaunch").on("click", function(){
    // set up modal to launch
    let thisID = $(this).attr("data-id")

    $("#saveNote").attr("data-id", thisID)
    $("#noteDisplay").text("")
    // console.log($(this).attr("id"))
    $.ajax({
        type: "GET",
        url: `/articles/${thisID}`, 
    }).then(function (result) {

        console.log(result)
        if(result.note){
            result.note.forEach((item) => {

                let noteP = $("<p>").text(item.body);
                let delBtn = $("<button>Delete</button>").addClass("delete btn btn-sm btn-danger").attr("data-id", item._id)
                $("#noteDisplay").append(noteP, delBtn)
            })
            
        } else if (!result.note){
            $("#noteDisplay").text("No notes for this article.")
        }
    })
})

$("#saveNote").on("click", function(){
    let newNote = $("#newNote").val();
    let artID = $(this).attr("data-id")
    // console.log(newNote)
    $.ajax({
        type: "POST",
        url: `/articles/${artID}`,
        data: {
            body: newNote
        }
    }).then(function (result) {
        location.reload()
    })
})

$(".notes").on("click", ".delete", function(){
    let noteID = $(this).attr("data-id")
    console.log(noteID)
    $.ajax({
        type: "DELETE",
        url: `/articles/notes/${noteID}`
    }).then(function(result){
        location.reload()
    })
})
