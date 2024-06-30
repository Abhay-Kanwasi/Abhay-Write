import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import FileSaver from "file-saver";
import axiosService, { getBaseURL } from '../../helpers/axios';

function Logging() {

  interface LogData {
    LogLevel: string;
    LogActivity: string;
    LogData: string;
    LogDetails: string;
  }
  
  const [data, setData] = useState<LogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<LogData[]>([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [filterdate, setFilterDate] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      if (!filterdate) {
        const url = `logging?page=${currentPage}`
        axiosService
          .get(`${getBaseURL()}/api/${url}`)
          .then((response) => {
            const { logs } = response.data;
            setData(logs);
          });
      } else {
        const url = `logging?filterdate=${filterdate}&pages=${currentPage}`;
        axiosService.get(`${getBaseURL()}/api/${url}`)
          .then((response) => {
            const logs = response.data.filtered_loggings; 
            setFilteredData(logs);
          });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlefilterdate = async () => {
    if (filterdate) {
      const formData = new FormData();
      formData.append("date", filterdate); 
      try {
        const url = `logging?filterdate=${filterdate}&pages=${currentPage}`;
        axiosService.get(`${getBaseURL()}/api/${url}`)
          .then((response) => {
            setFilteredData(response.data["filtered_loggings"]);
            setIsFilterApplied(true);
          });
      } catch (error) {
        console.log("Error in posting data :", error);
      }
    } else {
      console.log("Please select the date before applying the filter");
    }
  };

  const handleClearFilter = () => {
    setFilterDate(""); // Clear filter date
    setIsFilterApplied(false); // Reset filter applied state
    setCurrentPage(1);
  };

  // Render either filtered data or all data based on filter applied state
  const renderedData = isFilterApplied ? filteredData : data;

  const downloadLogFile = async () => {
    try {
      const response = await axiosService.get(`${getBaseURL()}/api/loggingDownload`);
      const data = response.data;
  
      const formattedLog = data
        .map((entry: LogData) => JSON.stringify(entry))
        .join("\n");
  
      const logBlob = new Blob([formattedLog], {
        type: "text/plain",
      });
  
      FileSaver.saveAs(logBlob, "Application.log");
    } catch (error) {
      console.log("error", error);
    }
  };
    
  const downloadDebugLog = async () => {
    try {
      const response = await axiosService(`${getBaseURL()}/api/download_logs`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/zip' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'debug_logs.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Error while downloading debug logs.");
    }
  };

  const handlerenderpreviouspage = async () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
 
  const handlerendernextpage = async () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <Box
      display="flex"
      height="700px"
      width="1300px"
      padding="2%"
      overflow="hidden"
      justifyContent="center"
      alignItems="center"
      minWidth="1300px"
    >
      <Box overflow="auto">
        <Box display="flex" justifyContent="center">
          <Box padding={1}>
            <Button onClick={downloadDebugLog}>Download Debug logs</Button>
          </Box>
          <Box padding={1}>
            <Button onClick={downloadLogFile}>Download Application log</Button>
          </Box>
          <Box padding={1}>
            <Input
              type="date"
              value={filterdate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {isFilterApplied ? (
              <Button onClick={handleClearFilter}>Clear</Button>
            ) : (
              <Button onClick={handlefilterdate}>Apply</Button>
            )}
          </Box>
        </Box>
        <TableContainer style={{ overflowY: 'scroll', overflowX: 'scroll' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="200px">Level</TableCell>
                <TableCell width="200px">Action</TableCell>
                <TableCell width="200px">Details</TableCell>
                <TableCell width="200px">Created Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center' }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : renderedData && renderedData.length > 0 ? (
                renderedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>{row.LogLevel}</TableCell>
                    <TableCell>{row.LogActivity}</TableCell>
                    <TableCell>{row.LogData}</TableCell>
                    <TableCell>{row.LogDetails}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center' }}>
                    No more logs available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="space-between" paddingTop="30px">
          <Button
            onClick={handlerenderpreviouspage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {renderedData && renderedData.length > 0 && (
            <Button
              onClick={handlerendernextpage}
              disabled={renderedData.length < itemsPerPage}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Logging;
