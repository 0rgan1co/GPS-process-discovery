
package tests;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.*;
import java.time.Duration;

public class LandingPageTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private final String BASE_URL = "https://gps-process-discovery-580576445498.us-west1.run.app";

    @BeforeMethod
    public void setup() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get(BASE_URL);
    }

    @Test(groups = "smoke")
    public void validateTitleAndHeroLoad() {
        String title = driver.getTitle();
        Assert.assertEquals(title, "GPS Process Discovery", "El título no coincide con el valor factual esperado.");
        
        WebElement heroHeading = driver.findElement(By.tagName("h1"));
        Assert.assertTrue(heroHeading.isDisplayed(), "El encabezado Hero no es observable.");
    }

    @Test(groups = "content")
    public void validateNavigationLinks() {
        // Validación del hipervínculo a funcionalidades
        WebElement featuresLink = driver.findElement(By.xpath("//button[contains(text(),'Funcionalidades')]"));
        featuresLink.click();
        
        WebElement section = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("funcionalidades")));
        Assert.assertTrue(section.isDisplayed(), "La navegación al anclaje de funcionalidades falló.");
    }

    @Test(groups = "content")
    public void validateProcessGraphSVG() {
        // Se requiere iniciar el análisis para observar el SVG
        driver.findElement(By.xpath("//button[contains(text(),'Iniciar Análisis')]")).click();
        
        // Espera a que el motor de IA procese y el SVG sea inyectado en el DOM
        WebElement svgElement = wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("svg")));
        Assert.assertNotNull(svgElement, "El mapa de flujo dinámico (D3 SVG) no fue generado.");
    }

    @Test(groups = "responsive")
    public void validateMobileMenu() {
        driver.manage().window().setSize(new Dimension(375, 812));
        WebElement nav = driver.findElement(By.tagName("nav"));
        Assert.assertTrue(nav.isDisplayed(), "El menú de navegación no es funcional en vista móvil.");
    }

    @AfterMethod
    public void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
