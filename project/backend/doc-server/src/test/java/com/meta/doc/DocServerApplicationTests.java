package com.meta.doc;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
		"logging.level.org.springframework.boot.context.properties=DEBUG"
})
class DocServerApplicationTests {
	// Test code
}