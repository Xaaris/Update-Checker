package com.xing.hw.productchecker

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("api")
class ApiHelloWorld {

    @GetMapping("hello")
    fun helloWorld(): Map<String,String> {
        return mapOf("message" to "hello-world ${UUID.randomUUID()}")
    }

}