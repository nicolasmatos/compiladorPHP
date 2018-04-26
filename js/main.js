$(document).ready(function(){
    /*$("#primeiro").focus();
    $(".pula").on("keydown", (function(e) {

        if(e.which == 13){
            var id = $(this).attr("linha");
            var totalLinha = $(this).parent().attr("totalLinha");

            $(".form-group").append("<input type='text' linha = '"+(parseInt(totalLinha) + 1)+"' class='form-control pula'>");

            $(this).parent().attr("totalLinha", parseInt(totalLinha) + 1);

            var index = $(this).parent().attr("totalLinha");

            $(this).val($(this).val()+" ");
            $(".pula").each(function () {
                if($(this).attr("linha") == index){
                    $(this).val("       ");
                    $(this).focus();
                }
            });
        }

        else if(e.which == 8){
            if($(this).val() == ""){
                var id = $(this).attr("linha");
                var index = parseInt(id)-1;
                $(".pula").each(function () {
                    if($(this).attr("linha") == index){
                        $(this).focus();
                    }
                });
            }
        }
    }));*/

   $("#codigo").on("keydown", (function(e) {
       if(e.which == 13 || e.which == 8){
            var tam = $(this).height();
            $('.numbers').css("height", (tam+4)+"px");
       }
   }));

    var map = {17: false, 32: false};
    $("#codigo").on("keydown", (function(e) {
        if (e.keyCode in map) {
            map[e.keyCode] = true;
            if (map[17] && map[32]) {
               $('.janela').css("display", "block");
            }
        }
    })).on("keyup", (function(e) {
        if (e.keyCode in map) {
            map[e.keyCode] = false;
        }
    }));

    

});