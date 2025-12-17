Design a pipeline to pull data from youtube based on a topic and ingest it into duckdb
Get input from the user for the topic before running the dag
The fields that we need are youtube_video_url, title, description, timestamp, chapters(if any), most importantly transcript
For a single topic let's pull a max of 10 videos
Persist the duckdb locally