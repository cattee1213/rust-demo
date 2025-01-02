use error_chain::error_chain;
use reqwest::blocking;
use serde::Deserialize;
use std::io::Read;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        HttpRequest(reqwest::Error);
        SerdeJson(serde_json::Error);
    }
}

#[derive(Deserialize)]
struct WeatherForecast {
    date: String,
    #[serde(rename = "temperatureC")]
    temperature_c: i32,
    #[serde(rename = "temperatureF")]
    temperature_f: i32,
    summary: String,
}

fn main() -> Result<()> {
    let request_url = format!(
        "{domain}/api/WeatherForecast/Get",
        domain = "http://1.94.203.134:8080"
    );

    let mut response = blocking::get(&request_url)?;
    let mut body = String::new();
    response.read_to_string(&mut body)?;

    let header = response.headers();
    let weather_forecasts: Vec<WeatherForecast> = serde_json::from_str(&body)?;

    println!("Header: {:?}", header);
    for weather in &weather_forecasts {
        println!(
            "Date: {}, Temperature: {}°C, {}°F, Summary: {}",
            weather.date, weather.temperature_c, weather.temperature_f, weather.summary
        );
    }

    Ok(())
}
