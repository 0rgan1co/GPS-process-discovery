
package tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LandingPage extends BasePage {

    // Locators robustos basados en la estructura actual
    private final By mainHeadline = By.xpath("//h1");
    private final By subHeadline = By.xpath("//h1/following-sibling::p");
    private final By ctaStart = By.xpath("//button[contains(text(),'Iniciar Análisis')]");
    private final By ctaDemo = By.xpath("//button[contains(text(),'Ver Demo')]");
    private final By integrationLogos = By.xpath("//span[text()='SAP']/parent::div");
    private final By socialProofSection = By.id("credibilidad");
    private final By metricOptimized = By.xpath("//p[text()='127+']");
    
    public LandingPage(WebDriver driver) {
        super(driver);
    }

    public String getHeadline() {
        return getText(mainHeadline);
    }

    public String getSubheadline() {
        return getText(subHeadline);
    }

    public boolean ctasAreVisible() {
        return isDisplayed(ctaStart) && isDisplayed(ctaDemo);
    }

    public boolean logosAreVisible() {
        return isDisplayed(integrationLogos);
    }

    public String getSocialProofMetric() {
        scrollToElement(socialProofSection);
        return getText(metricOptimized);
    }

    public boolean isCtaClickable() {
        return driver.findElement(ctaStart).isEnabled();
    }
}
