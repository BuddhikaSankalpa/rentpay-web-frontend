import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL     
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const superbase = createClient(url, key);

export default function uploadFile(file) {
  return new Promise((resolve, reject) => {

    const timestamp = Date.now();
    const fileName = timestamp + "-" + file.name;

    superbase.storage
      .from("Images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })
      .then(() => {
        const publicurl = superbase.storage
          .from("Images")
          .getPublicUrl(fileName).data.publicUrl;

        resolve(publicurl);
      })
      .catch((error) => {
        reject(error);
      });

  });
}