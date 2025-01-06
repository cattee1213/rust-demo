use std::fs::File;
use std::io::{self, copy};
use std::path::Path;
use zip::read::ZipArchive;

fn main() -> io::Result<()> {
    println!("decompressing...");
    let file = File::open("output.zip").expect("output.zip not found");
    let mut archive = ZipArchive::new(file)?;
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;

        // 判断是否是文件夹
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        let outpath = "output-dir".to_string() + "/" + outpath.to_str().unwrap();

        // 创建文件夹
        if outpath.ends_with('/') {
            println!("Creating dir: {}", outpath);
            std::fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = Path::new(&outpath).parent() {
                // 如果父目录不存在，则创建
                if !p.exists() {
                    std::fs::create_dir_all(&p).expect("create dir failed");
                }
            }

            let mut out_file = File::create(&outpath).expect("create file failed");
            copy(&mut file, &mut out_file)?;
        }
    }
    Ok(())
}
