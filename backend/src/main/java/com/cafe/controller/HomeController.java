package com.cafe.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

    @RequestMapping(value = {"/", "/home", "/index"})
    public String index() {
        return "index.html"; // Spring Boot sẽ trả về file index.html trong resources/static
    }
}
