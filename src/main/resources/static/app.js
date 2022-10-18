var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    let draw = null;
    const vertex = 4;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    const addLineToCanvas = (x0, y0, x1, y1) => {
              var canvas = document.getElementById("canvas");
              var ctx = canvas.getContext("2d");
              ctx.beginPath();
              ctx.strokeStyle = "blue";
              ctx.moveTo(x0, y0);
              ctx.lineTo(x1, y1);
              ctx.stroke();
    }

    const drawPolygon =  (polygon) => {
        for (let index = 0; index < vertex - 1; index++) {
            let p1 = polygon[index];
            let p2 = polygon[index+1];
            addLineToCanvas(p1.x, p1.y, p2.x, p2.y);
        }
        addLineToCanvas(polygon[0].x, polygon[0].y, polygon[vertex - 1].x, polygon[vertex - 1].y)
    }

    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    let mouseEventListener = function () {
        let canvas = document.getElementById("canvas");
        elemLeft = canvas.offsetLeft + canvas.clientLeft,
        elemTop = canvas.offsetTop + canvas.clientTop,
        canvas.addEventListener('click', function(event) {
            var x = event.pageX - elemLeft,
            y = event.pageY - elemTop;
            var pt=new Point(x,y);
            stompClient.send(`/app/newpoint.${draw}`, {}, JSON.stringify(pt)); ;
        });
    };


    var connectAndSubscribe = function (topic) {
        draw = topic
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(`/topic/newpoint.${draw}`, function (eventbody) {
                var theObject = JSON.parse(eventbody.body);
                console.log(theObject)
                var point = new Point(theObject.x, theObject.y);
                addPointToCanvas(point);
            });

            stompClient.subscribe(`/topic/newpolygon.${draw}`, function (eventbody) {
                var theObject = JSON.parse(eventbody.body);
                console.log("Polygon: " + theObject)
                drawPolygon(theObject);
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            //websocket connection
            mouseEventListener();
        },

        subscribe: function () {
            let topic = document.getElementById("dibujo").value;
            connectAndSubscribe(topic);
        },

        publishPoint: function(px, py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            //creando un objeto literal
            // stompClient.send("/topic/newpoint", {}, JSON.stringify({x:10,y:10}));
            //enviando un objeto creado a partir de una clase
            stompClient.send(`/app/newpoint.${draw}`, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();