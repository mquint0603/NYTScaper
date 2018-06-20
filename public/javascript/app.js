$(".save-btn").on("click", function(){
    console.log("saved")
    let thisID = $(this).attr("id")
    console.log($(this).attr("id"))
    $.ajax({
        type: "POST",
        url: `/save/${thisID}`, 
    }).then(function (result) {
        $(".save-btn").text("Saved!")
    })
})

$(".notes-btn").on("click", function(){
    // console.log("saved")
    let thisID = $(this).attr("id")
    // console.log($(this).attr("id"))
    $.ajax({
        type: "GET",
        url: `/articles/${thisID}`, 
    }).then(function (result) {
        
        console.log(result)
    })
})