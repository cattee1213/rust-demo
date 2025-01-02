use error_chain::error_chain;
use reqwest::header::USER_AGENT;
use reqwest::Client;
use serde::Deserialize;

#[derive(Deserialize)]
struct WeatherForecast {
    date: String,
    #[serde(rename = "temperatureC")]
    temperature_c: i32,
    #[serde(rename = "temperatureF")]
    temperature_f: i32,
    summary: String,
}

error_chain! {
  foreign_links {
    HttpRequest(reqwest::Error);
    SerdeJson(serde_json::Error);
  }
}

#[tokio::main]
async fn main() -> Result<()> {
    let client = Client::new();
    let res = client
        .get("http://1.94.203.134:8080/api/WeatherForecast/Get")
        .header(USER_AGENT, "RUST CLIENT")
        .send()
        .await
        .expect("Failed to send request");

    let body = res.text().await.expect("Failed to read response body");

    let forecasts: Vec<WeatherForecast> =
        serde_json::from_str(&body).expect("Failed to parse JSON");

    for forecast in forecasts {
        println!("Date: {}", forecast.date);
        println!("Temperature (C): {}", forecast.temperature_c);
        println!("Temperature (F): {}", forecast.temperature_f);
        println!("Summary: {}", forecast.summary);
        println!();
    }

    Ok(())
}
