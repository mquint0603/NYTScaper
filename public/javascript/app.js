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
            $("#noteDisplay").text(result.note)
        } else if (!result.note){
            $("#noteDisplay").text("No notes for this article.")
        }
    })
})

//ajax call to post note after clicking button on modal
