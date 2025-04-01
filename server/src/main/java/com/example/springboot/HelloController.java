package com.example.springboot;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@RestController
@CrossOrigin(origins = "*")
public class HelloController {

    // List of top 15 most common languages
    private static final List<String> COMMON_LANGUAGES = Arrays.asList(
        "English", "Mandarin", "Hindi", "Spanish", "French",
        "Arabic", "Bengali", "Russian", "Portuguese", "Urdu",
        "Indonesian", "German", "Japanese", "Swahili", "Marathi"
    );

    @GetMapping("/{language}")
    public ResponseEntity<String> index(@PathVariable String language) {
		String promptString = """
				You are a language flashcard maker, who translates from English to %s. You should output text in the format of CSV, but seperated with | instead of a comma. You have as input a users personal input, which you should use to make personalised phrases for them to memorise.
				In addition to this, you should generate 20 common sentences that are good to know, with a mix of past future and present tense, as well as a mix of first second and third person.
				You should use romanised letters no matter the language.
                Ensure the only columns are english and the target language, with no column such as notes etc. It should be directly in CSV format with no extra characters.
                It should include a header row with English and the target language
				
				
				""".formatted(language);
        if (COMMON_LANGUAGES.contains(language)) {
 			String responseFromGemini = callGeminiApi(promptString);
            System.out.println(responseFromGemini);
            // Use Jackson to construct the JSON
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode jsonResponse = mapper.createObjectNode();
            jsonResponse.put("language", language);
            try {
                jsonResponse.put("gemini_response", mapper.readTree(responseFromGemini));

                // Convert JSON object to string
                String jsonString = mapper.writeValueAsString(jsonResponse);
                return ResponseEntity.ok(jsonString);
            } catch (Exception e) {
                // Handle JSON construction errors
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("{\"error\": \"internal_server_error\"}");
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("{\"error\": \"language_not_in_list\"}");
        }
    }

    private String callGeminiApi(String prompt) {
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            return "Error: GEMINI_API_KEY environment variable not set.";
        }
        try {
            // Construct the request body
            String requestBody = """
                    {
                      "contents": [{
                        "parts": [{"text": "%s"}]
                      }]
                    }
                    """.formatted(prompt);

            // Create the HttpClient
            HttpClient client = HttpClient.newHttpClient();

            // Create the POST request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // Send the request and get the response
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Return the response body
            return response.body();
        } catch (Exception e) {
            // Handle errors during API call
            return "Error calling Gemini API: " + e.getMessage();
        }
    }

}
