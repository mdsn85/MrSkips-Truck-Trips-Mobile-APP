export class dateCalc{
    ConvertStringToDate(st){
        let year = st.substring(0, 4);
        let month = st.substring(5, 7);
        let day = st.substring(8, 10);
        console.log(year +","+month+","+day);
        var dd =  new Date(year , parseInt(month)-1, day);
    
        return dd;
    }
  
    formatDate(date) {
      var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
  
      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;
  
      return [year, month, day].join('-');
    } 
}
