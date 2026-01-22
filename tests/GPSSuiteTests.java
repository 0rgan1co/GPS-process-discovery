
package tests;

import org.openqa.selenium.Dimension;
import org.testng.Assert;
import org.testng.annotations.Test;

public class GPSSuiteTests extends TestBase {

    @Test(description = "ESCENARIO 1.1: Landing page disponible")
    public void testLandingAvailability() {
        driver.get(APP_URL);
        LandingPage landing = new LandingPage(driver);
        
        // El test fallará inicialmente si el texto no es exacto (TDD)
        Assert.assertEquals(landing.getHeadline(), 
            "La plataforma de Process Mining que convierte datos en ROI garantizado",
            "Falla TDD: El headline no coincide con el requerimiento de marketing.");
            
        Assert.assertTrue(landing.ctasAreVisible(), "Los CTAs críticos no están presentes.");
    }

    @Test(description = "ESCENARIO 2.1: Elementos del Hero")
    public void testHeroElements() {
        driver.get(APP_URL);
        LandingPage landing = new LandingPage(driver);
        
        Assert.assertTrue(landing.getHeadline().contains("ROI garantizado"));
        Assert.assertTrue(landing.getSubheadline().contains("48h vs 8-12 semanas"));
        Assert.assertTrue(landing.logosAreVisible(), "Logos de integración no encontrados.");
    }

    @Test(description = "ESCENARIO 3.3: Social Proof")
    public void testSocialProof() {
        driver.get(APP_URL);
        LandingPage landing = new LandingPage(driver);
        
        Assert.assertEquals(landing.getSocialProofMetric(), "127+", 
            "La métrica factual de social proof no es correcta.");
    }

    @Test(description = "ESCENARIO 5.1: Mobile responsive")
    public void testMobileResponsive() {
        driver.get(APP_URL);
        driver.manage().window().setSize(new Dimension(375, 812)); // iPhone X
        
        LandingPage landing = new LandingPage(driver);
        Assert.assertTrue(landing.isCtaClickable(), "CTA no accesible en vista móvil.");
    }
}
