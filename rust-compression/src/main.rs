use std::fs::File;
use std::io::{self, copy};
use zip::write::FileOptions;
use zip::ZipWriter;

fn main() -> io::Result<()> {
    println!("compressing...");
    let out_put = File::create("output.zip")?;
    let mut zip = ZipWriter::new(out_put);
    let mut file1 = File::open("file1.txt")?;
    let mut file2 = File::open("file2.txt")?;
    zip.start_file("file1.txt", FileOptions::default())?;
    copy(&mut file1, &mut zip)?;
    zip.start_file("file2.txt", FileOptions::default())?;
    copy(&mut file2, &mut zip)?;
    zip.finish()?;

    Ok(())
}
