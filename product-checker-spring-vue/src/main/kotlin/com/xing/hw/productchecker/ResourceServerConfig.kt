package com.xing.hw.productchecker

import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter

@Configuration
class ResourceServerConfig : WebSecurityConfigurerAdapter() {
    override fun configure(http: HttpSecurity) {
        http.authorizeRequests()
                .mvcMatchers("/api/**").hasAuthority("SCOPE_productchecker")
                .anyRequest().permitAll()
                .and()
                .oauth2ResourceServer()
                .jwt()
    }
}
