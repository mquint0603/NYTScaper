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

$(".notes-btn").on("click", function(){
    // set up modal to launch
    let thisID = $(this).attr("id")
    // console.log($(this).attr("id"))
    $.ajax({
        type: "GET",
        url: `/articles/${thisID}`, 
    }).then(function (result) {

        console.log(result)

        //populate modal with result.notes or "no notes"
    })
})

//ajax call to post note after clicking button on modal
