<?php
/**
 * This class receives a file, processes it, checks the neccssary property and save to the desired destination if it meets the necessary criteria. It then calls a given function with the file's address in the server as it's parameter. The function executes depending on how you write it.
 */
class File {
	public $size = array('default' => 0, 'nice' => 0);
	public $name;
	public $type;
	public $tmp;
	function __construct($file){
		$this->type = $file['type'];
		$this->name = $file['name'];
		$this->tmp = $file['tmp_name'];
		$size = $file['size'];
		$this->size['default'] = $size; //Default size in Bytes
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        for ($i = count($units); $i >= 0; $i--) {
        	$ratio = $size/pow(1024, $i);
        	if ($ratio >= 0.8) {
        		$this->size['nice'] = number_format($ratio, 2, ".", ",") . $units[$i];
        		break;
        	}
        }
	}
	public function save_to($to){
		$file_link = $to . '/' . $this->name;
		//First we assume the directory $to exists if not, we create a new one.
		$creatd = true;
		if (!file_exists($to)) {
			$creatd = @mkdir($to, 0777, true);
		}
		if ($creatd) {
			/************************************************************
			Since we split the file in js, its time to join the files back to whole. All fractions must have the same name making it easy to join them as one. We recieve on fraction at a time from the client side and append it to the existing one or if it is the first half, it is appended to an empty file... so its all the same. For this reason, send the fractions in order else the rejoined file wont make sense.
			*************************************************************/
			$open = fopen($file_link, 'ab');//Opens an existing fraction or creates an empty file and open for appending (append binary) 
			$readNew = fopen($this->tmp, 'rb'); // Open the new coming fraction for reading (read binary)
			if ($readNew) { // if the new fraction file has been open for reading
				while ($buff = fread($readNew, 1048576)) {// read the fraction 1MB at a time;
					fwrite($open, $buff); // append to the existing fraction.
				}
			}
			fclose($readNew);
			fclose($open);
		}
	//The process continues until the last fraction is received
	   return $this->name;
 }
}