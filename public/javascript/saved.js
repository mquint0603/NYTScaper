let saved = JSON.parse(localStorage.saved)

$.ajax("/articles/saved", {
    type: "POST",
    data: {
        saved: saved
    }
}).then(function(res){
    location.reload()
})

