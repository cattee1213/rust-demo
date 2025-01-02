use error_chain::error_chain;
use reqwest::get;
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
    let request_url = format!(
        "{domain}/api/WeatherForecast/Get",
        domain = "http://1.94.203.134:8080"
    );
    let response = get(&request_url).await?;
    let header = response.headers();
    println!("Header: {:?}", header);

    let body = response.text().await?;
    let weather_forecasts: Vec<WeatherForecast> = serde_json::from_str(&body)?;
    for weather in &weather_forecasts {
        println!(
            "Date: {}, Temperature: {}°C, {}°F, Summary: {}",
            weather.date, weather.temperature_c, weather.temperature_f, weather.summary
        );
    }
    Ok(())
}
