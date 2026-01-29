Authentication

Angular 16 Client (Browser)
           |
           v
      Spring Boot API (Resource Server)
           |
           v
        Okta (Authorization Server)



    Okta handles authentication (login) and issues tokens.

    Angular app handles the frontend, stores tokens securely (e.g., in memory or sessionStorage).

    Spring Boot is the resource server, validates the tokens for authorization.

    Supports SSO, so a user logged in once can access multiple apps without re-login.


     The Step-by-Step Flow

    User Initiates Login: User clicks "Login" in your app, triggering this URL to open in their browser.
    Okta Authenticates User: Okta checks for an existing session. If none exists, it displays the sign-in page.
    User Consents (Optional): If requested scopes require it, Okta asks the user to consent to sharing their data.
    Redirect with Code: Upon successful authentication, Okta redirects the browser back to: https://yourapp.com.
    Token Exchange (Next Step): Your server (backend) takes the code and exchanges it for an Access Token and ID Token by making a server-to-server call to Okta's /token endpoint. 

    --------------------------------------------------
    Step 1: User initiates login

User clicks "Login" in Angular app.

Angular redirects to Okta authorization endpoint:

Step 2: User authenticates with Okta

Okta prompts login (or uses SSO if user already logged in).

Once successful, Okta redirects back to Angular redirect URI with authorization code:

Step 3: Angular exchanges code for tokens

Angular (frontend) sends POST request to Okta token endpoint:

Payload:
grant_type=authorization_code
code=AUTH_CODE
redirect_uri=https://yourapp.com/login/callback
client_id=CLIENT_ID
client_secret=CLIENT_SECRET (if confidential)

Resp
{
  "access_token": "ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH_TOKEN",
  "id_token": "ID_TOKEN" //user identity
}

Angular        Spring Boot        Okta
   |                 |              |
   |---login-------->|              |
   |   redirect      |              |
   |---------------->|              |
   |                 |---auth------>|
   |<--auth code-----|              |
   |                 |              |
   |--exchange code--|              |
   |<--tokens--------|              |
   |                 |              |
   |---API call------|-->validate-->| JWT valid
   |                 |<------------|
   |<--response------|              |
   |                 |              |


@RestController
@RequestMapping("/api")
public class StudentController {

    @GetMapping("/students/{id}")
    public Student getStudent(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        System.out.println("User: " + jwt.getClaimAsString("email"));
        return studentService.getStudent(id);
    }
}


@GetMapping("/profile")
# public String getProfile(@CookieValue("refresh_token") String refreshToken) {
    System.out.println(refreshToken); // Logs the refresh token sent by the browser
    return "profile";
}


@Configuration
@EnableWebSecurity // Optional, useful for general web security config
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class MethodSecurityConfig {

@Service
public class ProductService {

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(Long productId) {
  @PreAuthorize("hasAuthority('product:write')")
  @PreAuthorize("hasAnyRole('ADMIN', 'USER')")

@Secured("ROLE_SUPER_ADMIN")
@PostAuthorize("returnObject.username == authentication.name")

@PostFilter("filterObject.owner == authentication.name")




