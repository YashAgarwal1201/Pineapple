"use client";
import { useState } from "react";

import { X } from "lucide-react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Sidebar } from "primereact/sidebar";
import { SubmitHandler, useForm } from "react-hook-form";

import { FeedbackFormType } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";

const FeedbackDialog = () => {
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { name: "", email: "", message: "" },
    mode: "onChange",
  });

  const {
    isFeedbackDialogOpen,
    closeFeedbackDialog,
    showToast,
    toggleSideMenu,
  } = usePineappleStore();

  const [loader, setLoader] = useState(false);

  const sanitizeInput = (input: string) => {
    const sanitized = input.replace(/[<>"'`;&]/g, "");
    return sanitized.trim();
  };

  const onSubmit: SubmitHandler<FeedbackFormType> = async (data) => {
    try {
      setLoader(true);
      const sanitizedData = {
        name: sanitizeInput(data.name),
        email: sanitizeInput(data.email),
        message: sanitizeInput(data.message),
      };

      const response = await fetch(
        "/api-services/pineapple/feedback-form-data",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedData),
        }
      );

      await response.json();

      if (response.ok) {
        showToast("success", "Success", "Data submitted successfully");
        setLoader(false);
        reset();
        closeFeedbackDialog();
      } else {
        showToast("error", "Error", "Error submitting form");
        setLoader(false);
        console.error(response);
      }
    } catch (error) {
      setLoader(false);
      showToast("error", "Error", "Unexpected error occurred");
      console.error("Error:", error);
    }
  };

  const onDiscard = () => {
    reset();
    closeFeedbackDialog();
  };

  if (!isFeedbackDialogOpen) return null;

  return (
    <Sidebar
      visible={isFeedbackDialogOpen}
      onHide={() => {
        closeFeedbackDialog();
        toggleSideMenu();
        // setOpenMenuPanel(-1); // Reset open panel on close
      }}
      dismissable
      draggable={false}
      header={
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-lime-700 dark:text-lime-400">
          More Options
        </h2>
      }
      className="side-menu !rounded-none md:!rounded-l-3xl !bg-white dark:!bg-black aboutDialog !w-full md:!w-[768px]"
      // class="!w-full md:!w-[768px] rounded-none md:!rounded-l-xl bg-stone-50 dark:bg-stone-900 font-content !text-green-700 dark:!text-green-300"
      position="right"
      closeIcon={
        <span className=" text-naples-yellow">
          <X size={16} />
        </span>
      }
      maskClassName="backdrop-blur"
    >
      <div className="w-full px-4 py-4 bg-amber-50 dark:bg-stone-900 rounded-3xl overflow-y-auto text-stone-700 dark:text-stone-300 font-content">
        <form
          className="feedback-form font-content"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="form-section w-full py-4 px-2 flex flex-col gap-y-2 sm:gap-y-3 rounded-xl">
            <div className="flex justify-between items-center">
              <label className="font-heading text-lg sm:text-xl  text-stone-600 dark:text-stone-300">
                <span className="pi pi-id-card mr-4 text-lime-500 dark:text-lime-600"></span>
                Name *
              </label>
              {errors.name && (
                <small className="text-red-500">{errors.name.message}</small>
              )}
            </div>
            <InputText
              disabled={loader}
              className="disabled:opacity-70 p-2 sm:p-3 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 !rounded-2xl"
              {...register("name", { required: "Name is required" })}
              maxLength={100}
              placeholder="John Doe"
            />
          </div>
          <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-stone-200 dark:bg-stone-700" />

          <div className="form-section w-full py-4 px-2 flex flex-col gap-y-2 sm:gap-y-3 rounded-xl">
            <div className="flex justify-between items-center">
              <label className="font-heading text-lg sm:text-xl text-stone-600 dark:text-stone-300">
                <span className="pi pi-envelope mr-4 text-lime-500 dark:text-lime-600"></span>
                E-mail *
              </label>
              {errors.email && (
                <small className="text-red-500">{errors.email.message}</small>
              )}
            </div>
            <InputText
              disabled={loader}
              className="disabled:opacity-70 p-2 sm:p-3 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 !rounded-2xl"
              type="email"
              {...register("email", {
                required: "E-mail is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              maxLength={75}
              placeholder="email@example.com"
            />
          </div>
          <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-stone-200 dark:bg-stone-700" />

          <div className="form-section w-full py-4 px-2 flex flex-col gap-y-2 sm:gap-y-3 rounded-xl">
            <div className="flex justify-between items-center">
              <label className="font-heading text-lg sm:text-xl text-stone-600 dark:text-stone-300">
                <span className="pi pi-pencil mr-4 text-lime-500 dark:text-lime-600"></span>
                Message *
              </label>
              {errors.message && (
                <small className="text-red-500">{errors.message.message}</small>
              )}
            </div>
            <InputTextarea
              disabled={loader}
              className="disabled:opacity-70 h-40 p-2 sm:p-3 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 !rounded-2xl resize-none"
              maxLength={1000}
              {...register("message", { required: "Message is required" })}
              placeholder="Its a brand new day, and the sun is high. All the birds are singing, 'you are gonnna die'..."
            />
          </div>
          <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-stone-200 dark:bg-stone-700" />
          <div className="w-full py-0 flex flex-row items-center flex-1 gap-2 sm:gap-3 rounded-xl">
            <Button
              disabled={loader}
              type="button"
              onClick={() => onDiscard()}
              className=" flex-1 flex justify-center items-center gap-x-2 py-2 px-4 text-rose-600 dark:text-rose-400 font-content !bg-transparent !rounded-full"
            >
              <span className="pi pi-trash mr-4"></span>
              <span>Discard</span>
            </Button>

            <Button
              type="submit"
              disabled={!isValid || loader}
              className="disabled:opacity-50  flex-1 flex justify-center gap-x-2 items-center py-2 px-4 bg-rose-600 dark:bg-rose-400  !border-none !rounded-full"
            >
              <span className="pi pi-send mr-4"></span>
              <span>{loader ? "Sending..." : "Send"}</span>
            </Button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
};

export default FeedbackDialog;
