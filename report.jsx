import { useEffect, useRef, useState } from "react";
import "../pages/report.css";
import Header from "../components/header";
import { Button, Form, Select, Radio, DatePicker, Space } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import customParseFormat from "dayjs/plugin/customParseFormat";
import locale from "antd/es/date-picker/locale/ja_JP";
import { DownloadOutlined } from "@ant-design/icons";
import { UNIT, DATE, GROUP, REPORT_TYPE } from "./reportPageConstant";
import { requestReport } from "../components/common/services/reportingRequestService";
import { CSVLink } from "react-csv";

const Report = () => {
  dayjs.extend(customParseFormat);
  const { RangePicker } = DatePicker;
  const [showAggregatedForm, setShowAggregatedForm] = useState(true);
  const [showRawDataForm, setShowRawDataForm] = useState(false);
  const [interval, setInterval] = useState("");
  const [unit, setUnit] = useState("PHC (050-1)");
  const [group, setGroup] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("AGGREGATE");
  const [exportData, setExportData] = useState([]);
  const CSVRef = useRef();

  const handleExport = async (interval, unit, group, startDate, endDate, type) => {
    const { result } = await requestReport({ interval, unit, group, startDate, endDate, type });
    setExportData(result.data);
  };

  useEffect(() => {
    if (exportData.length) {
      CSVRef.current.link.click();
    }
  }, [exportData]);

  const handleShowForm = (item) => {
    switch (item) {
      case "AGGREGATE":
        setShowAggregatedForm(true);
        setShowRawDataForm(false);
        break;
      case "RAW":
        setShowAggregatedForm(false);
        setShowRawDataForm(true);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <Header />
      {showAggregatedForm ? (
        <div className="Report">
          <div className="report-main">
            <div className="report-aggregated-form">
              <Form layout="horizontal">
                <Form.Item className="report-type-text" label="レポート種類" colon="false">
                  <Select
                    defaultValue={type}
                    onChange={(val) => {
                      handleShowForm(val);
                      setType(val);
                    }}
                    options={REPORT_TYPE}
                  ></Select>
                </Form.Item>
              </Form>
              <div className="aggregated-report-form">
                <Form layout="vertical">
                  <Form.Item
                    className="form-unit"
                    label="ユニット"
                    colon="false"
                  >
                    <Select className="select-unit" defaultValue={unit} options={UNIT} onChange={(value) => setUnit(value)}></Select>
                  </Form.Item>
                  <Form.Item 
                    className="form-aggregation-unit"
                    label="集計単位" 
                    colon="false"
                    name="radio-group" 
                    rules={[
                      { 
                        required: true, 
                        message: "Please pick an item!" }
                      ]}
                    >
                    <Radio.Group size="small">
                      {GROUP.map((res) => {
                        return (
                          <Radio className={res.className} value={res.value} key={res.value} onChange={() => setGroup(res.value)}>
                            {res.label}
                          </Radio>
                        );
                      })}
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item 
                    className="form-aggregation-period" 
                    label="集計期間" 
                    colon="false" 
                    name="radio-date"
                    rules={[
                      { 
                        required: true, 
                        message: "Please pick an item!" 
                      }
                    ]}
                  >
                    <Radio.Group size="small">
                      {DATE.map((res) => {
                        return (
                          <Radio className={res.className} value={res.value} key={res.value} onChange={() => setInterval(res.value)}>
                            {res.label}
                          </Radio>
                        );
                      })}
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    className="form-output-object"
                    label="出力対象"
                    colon="false"
                    name="range-picker-aggregate"
                    rules={[
                        {
                          type: "array",
                          required: true,
                          message: "Please select date!",
                        },
                      ]} 
                  >
                    <Space direction="vertical" size={12}>
                      {interval === "MONTH" ? (
                        <RangePicker
                          locale={locale}
                          size="small"
                          picker={"month"}
                          disabledDate={(current) => {
                            return current && current > dayjs().endOf("day");
                          }}
                          onChange={(value) => {
                            const initialMonth = value[0]?.$M + 1;
                            const endMonth = value[1]?.$M + 1;
                            const formatStartMonth = `${value[0]?.$y.toString()}-${initialMonth.toString().padStart(2, "0")}-01`;
                            const formatEndMonth = `${value[1]?.$y.toString()}-${endMonth.toString().padStart(2, "0")}-01`;
                            setStartDate(formatStartMonth);
                            setEndDate(formatEndMonth);
                          }}
                        />
                      ) : (
                        <RangePicker
                          locale={locale}
                          size="small"
                          disabledDate={(current) => {
                            return current && current > dayjs().endOf("day");
                          }}
                          onChange={(value) => {
                            const initial = value[0]?.$d;
                            const end = value[1]?.$d;
                            const initialFormatDate = dayjs(initial).format("YYYY-MM-DD");
                            const endFormatDate = dayjs(end).format("YYYY-MM-DD");
                            setStartDate(initialFormatDate);
                            setEndDate(endFormatDate);
                          }}
                        />
                      )}
                    </Space>
                  </Form.Item>
                  <Form.Item 
                    className="form-download">
                    <Button
                      type="primary"
                      size="small"
                      icon={<DownloadOutlined />}
                      htmlType="submit"
                      className="button-download"
                      onClick={() => handleExport(interval, unit, group, startDate, endDate, type)}
                    >
                      ダウンロード
                    </Button>
                    <CSVLink ref={CSVRef} filename="OLC_Report.csv" data={exportData}>
                        {" "}
                    </CSVLink>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        showRawDataForm && (
          <div className="Report">
            <div className="report-main">
              <div className="report-raw-data-form">
                <Form layout="horizontal">
                  <Form.Item className="report-type-text" label="レポート種類" colon="false">
                    <Select
                      onChange={(val) => {
                        handleShowForm(val);
                        setType(val);
                      }}
                      options={REPORT_TYPE}
                    ></Select>
                  </Form.Item>
                </Form>
                <div className="raw-data-form">
                  <Form layout="vertical">
                    <Form.Item className="form-unit" label="ユニット" colon="false">
                      <Select className="select-unit" defaultValue={unit} options={UNIT} onChange={(value) => setUnit(value)}></Select>
                    </Form.Item>
                    <Form.Item 
                      className="form-output-object" 
                      label="出力対象" 
                      colon="false"
                      name="range-picker-raw"
                      rules={[
                        {
                          type: "array",
                          required: true,
                          message: "Please select date!",
                        },
                      ]}  
                    >
                      <Space direction="vertical" size={12}>
                        <RangePicker
                          locale={locale}
                          size="small"
                          disabledDate={(current) => {
                            return current && current > dayjs().endOf("day");
                          }}
                          onChange={(value) => {
                            const initial = value[0]?.$d;
                            const end = value[1]?.$d;
                            const initialFormatDate = dayjs(initial).format("YYYY-MM-DD");
                            const endFormatDate = dayjs(end).format("YYYY-MM-DD");
                            setStartDate(initialFormatDate);
                            setEndDate(endFormatDate);
                          }}
                        />
                      </Space>
                    </Form.Item>
                    <Form.Item className="form-download">
                      <Button
                        type="primary"
                        size="small"
                        icon={<DownloadOutlined />}
                        htmlType="submit"
                        className="button-download"
                        onClick={() => handleExport(interval, unit, group, startDate, endDate, type)}
                      >
                        ダウンロード
                      </Button>
                      <CSVLink ref={CSVRef} filename="OLC_Report.csv" data={exportData}>
                        {" "}
                      </CSVLink>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Report;
