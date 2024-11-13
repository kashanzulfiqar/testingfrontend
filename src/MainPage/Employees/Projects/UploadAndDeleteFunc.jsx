import { message } from "antd";
import { apiServices } from "../../../Services/apiServices";
import { apiUploadToS3 } from "../../../Services/uploadImage";

export const DeleteFiles = async (files, user_state) => {
    // Create an array of promises for deleting each file
    const deletionPromises = files?.map((file) => {
      let data = {
        resource_type: file?.resource_type,
      };

      if (file?.public_id) {
        data.public_id = file.public_id;
      } else if (file?.imageUrl) {
        data.secure_url = file.imageUrl;
      }
      return apiServices("DELETE", `user/deletefile`, data, user_state)
        .then((res) => {
          if (res.data.success) {
            console.log(`Deleted: ${file.public_id}`);
            return { success: true, public_id: file.public_id };
          } else {
            throw new Error(`Failed to delete: ${file.public_id}`);
          }
        })
        .catch((err) => {
          console.error(`Error deleting ${file.public_id}:`, err);
          // Return an error object instead of throwing to handle it gracefully in Promise.all
          return { success: false, public_id: file.public_id, error: err };
        });
    });

    // Wait for all deletion promises to resolve
    try {
      const results = await Promise.all(deletionPromises);
      // Filter out successful deletions
      const successfulDeletes = results.filter((result) => result.success);
      const failedDeletes = results.filter((result) => !result.success);

      console.log(`Successfully deleted ${successfulDeletes.length} files.`);
      if (failedDeletes.length > 0) {
        console.error(`Failed to delete ${failedDeletes.length} files.`);
        message.error("Some files could not be deleted.");
      }
    } catch (error) {
      message.error("An error occurred while deleting files.");
    }
};

export const uploadFunction = async (files) => {
    const uploadPromises = files?.map((file) => {
      return apiUploadToS3(file)
        .then((res) => ({
          asset_id: res?.data?.result?.asset_id,
          public_id: res?.data?.result?.public_id,
          fileName: file?.name,
          imageUrl: res?.data?.result?.secure_url,
          resource_type: res?.data?.result?.resource_type,
        }))
        .catch((err) => {
          message.error(
            err?.response?.data?.msg
              ? err.response.data.msg
              : err.response.data.validation?.body?.message
              ? err.response.data.validation.body.message
              : t("projectScreen.errors.fileUploadError", { file: file?.name })
          );
          throw err;
        });
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("File upload error:", error);
    }
};