package com.meta.user.config;

import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.contrib.sampler.RuleBasedRoutingSampler;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import io.opentelemetry.semconv.UrlAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenTelemetryConfig {

    @Bean
    public AutoConfigurationCustomizerProvider otelCustomizer() {
        return p -> p.addSamplerCustomizer(this::configureSampler);
        // ❌ No need to customize SpanExporter unless you need headers
    }

    /** suppress spans for actuator endpoints */
    private RuleBasedRoutingSampler configureSampler(Sampler fallback, ConfigProperties config) {
        return RuleBasedRoutingSampler.builder(SpanKind.SERVER, fallback)
                .drop(UrlAttributes.URL_PATH, "^/actuator")
                .build();
    }
}