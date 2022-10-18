package edu.eci.arsw.collabpaint;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class STOMPMessagesHandler {

    private static final int LADOS = 4;
    @Autowired
    SimpMessagingTemplate msgt;

    ConcurrentHashMap<Integer, CopyOnWriteArrayList<Point>> polygons = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        int polygonIndex = Integer.parseInt(numdibujo)-1;
        if (polygons.get(polygonIndex) == null){
            polygons.put(polygonIndex, new CopyOnWriteArrayList<>());
            polygons.get(polygonIndex).add(pt);
        }else if (polygons.get(polygonIndex).size() % LADOS == 0){
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygons.get(polygonIndex).subList(polygons.get(polygonIndex).size()-LADOS,polygons.get(polygonIndex).size()));
            polygons.get(polygonIndex).add(pt);
        }else {
            polygons.get(polygonIndex).add(pt);
        }
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);


    }
}
