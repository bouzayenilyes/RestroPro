import React, { useRef, useState } from "react";
import Page from "../components/Page";
import { iconStroke } from "../config/config";
import { IconChevronRight, IconCsv, IconDownload, IconFileTypeCsv, IconTableImport } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { uploadBulkCustomers } from "../controllers/customers.controller";
import { useTranslation } from "react-i18next";

export default function CustomersImportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fileName, setFileName] = useState(null)
  const [customers, setCustomers] = useState([])

  const customerTableColumns = [
    "phone",
    "name",
    "email",
    "birth_date",
    "gender"
  ];

  const btnDownloadTemplate = async () => {
    try {
      const { saveAs } = await import("file-saver");
      const { Parser } = await import("@json2csv/plainjs");
  
      // Define the data
      const data = [
        { phone: '+1 1234567890', name: 'Nancy Patel', email: 'nancy@myapp.com', birth_date: 'YYYY-MM-DD hh:mm:ss', gender: 'female' },
        { phone: '+1 9898981212', name: 'Danny Patel', email: 'danny@myapp.com', birth_date: 'YYYY-MM-DD hh:mm:ss', gender: 'male' },
      ];
  
      // Set options for the Parser
      const opt = {
        fields: customerTableColumns, // Set the fields explicitly
      };
  
      // Initialize the parser and parse the data
      const parser = new Parser(opt);
      const csvData = parser.parse(data);
  
      // Create a blob from the CSV data and download it
      const blob = new Blob([csvData], { type: "application/csv" });
      saveAs(blob, "customers-upload-template.csv");
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error(t("customers_import.error_downloading_file"));
    }
  };

  const handleFileChange = async (e) => {
    const { parse } = await import("papaparse");

    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }

    if (!file) {
      return;
    }

    parse(file, {
      complete: function (result) {
        const csvColumns = result.data[0];
        let rows = result.data;
        rows.shift();

        // Filter out any empty rows
        rows = rows.filter((row) => row.some((cell) => cell.trim() !== ""));

        if (csvColumns.join(",") != customerTableColumns.join(",")) {
          toast.error(t("customers_import.column_mismatch"));
          return;
        }

        if (rows.length === 0) {
          toast.error(t("customers_import.no_data"));
          return;
        }

        setCustomers(rows);
      },
    });
  };

  const btnProceed = async () => {
    if(customers.length == 0) {
      toast.error(t("customers_import.no_data_found"));
      return;
    }
    try {
      toast.loading(t("customers_import.loading_message"));

      const res = await uploadBulkCustomers(customers);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);
        navigate(-1);
      }

    } catch (error) {
      console.log(error);
      const message = error?.response?.data?.message || t("customers_import.error_processing_request");
      toast.dismiss();
      toast.error(message);
    }
  }

  return (
    <Page>
      <div className="flex gap-4 flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard/customers" className="hover:underline">{t("customers_import.breadcrumb_customers")}</Link>
          <IconChevronRight stroke={iconStroke} size={18} />
          <p>{t("customers_import.breadcrumb_import")}</p>
        </div>

        <button onClick={btnDownloadTemplate} className="btn btn-sm dark:rounded-lg">
          <IconDownload stroke={iconStroke} size={18} /> {t("customers_import.download_template")}
        </button>
      </div>

      <div className="mx-auto mt-10 w-full md:w-3/4 lg:w-1/2 border border-dashed dark:border-restro-gray rounded-2xl text-gray-500 flex items-center justify-center flex-col gap-2 px-4 py-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#101010] transition">
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <IconTableImport stroke={iconStroke} size={48} />
          <p>{t("customers_import.select_file")}</p>
          <p className="text-xs text-center">{t("customers_import.file_note")}</p>
        </label>
      </div>

      {customers.length > 0 && <div className="mt-4 flex flex-col items-center">
        <div className="flex items-center justify-center text-center gap-2">
          <IconFileTypeCsv stroke={iconStroke} size={18} /> {t("customers_import.file_ready", { fileName })}
        </div>
        <p className="text-sm text-center" dangerouslySetInnerHTML={{ __html: t("customers_import.customers_count", { count: customers.length }) }}></p>

        <button onClick={btnProceed} className="btn btn-sm bg-restro-green hover:bg-restro-green-dark text-white w-full md:w-3/4 lg:w-1/2 mt-8">{t("customers_import.proceed_button")}</button>
      </div>}
    </Page>
  )
}
